import React, { useState, useEffect } from "react";
import Layout from "./layout";
import { Link, useHistory } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";
import { toast } from "react-toastify";

const Staff = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const history = useHistory();
  const [search, setSearch] = useState("");
  const [staffs, setStaffs] = useState([]);
  const [filteredData, setFilteredData] = useState(staffs);
  const user_data = JSON.parse(localStorage.getItem("user_detail"));

  const fetchStaff = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/staff`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      setStaffs(response.data.data);
    } catch (error) {
      console.error("Error fetching staffs:", error);
    }
  };

  const handleCreateStaff = () => {
    localStorage.setItem("staff_detail", null);
  };
  const handleEdit = (row) => {
    localStorage.setItem("staff_detail", JSON.stringify(row));
  };
  const handleDeleteConfirm = (id) => {
    if (window.confirm("Are you sure you want to delete this staff?")) {
      handleDelete(id);
    }
  };
  const handleDelete = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/staff/${id}`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${user_data.token}`,
      },
    });
    if (response) {
      history.push("/staff");
      toast.success("staff Deleted");
      fetchStaff();
    }
  };
  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    const searchText = search.toLowerCase();

    const result = staffs.filter((item) => {
      const searchable = `
      ${item.id}
      ${item.store?.name}
      ${item.name}
      ${item.username}
      ${item.role}
    `.toLowerCase();

      return searchable.includes(searchText);
    });

    setFilteredData(result);
  }, [search, staffs]);

  const columns = [
    {
      name: "Id",
      selector: (row) => row.id,
      sortable: true,
      width: "150px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      width: "200px",
    },
    {
      name: "Username",
      selector: (row) => row.username,
      sortable: true,
      width: "200px",
    },
    {
      name: "Role",
      selector: (row) => row.role,
      sortable: true,
      width: "250px",
    },
     {
      name: "Branch",
      selector: (row) => row.store?.name || "N/A",
      sortable: true,
      width: "250px",
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="list-icon-function">
          <div className="item edit">
            <Link to={`/staff/edit/${row.id}`} onClick={() => handleEdit(row)}>
              <i className="icon-edit-3"></i>
            </Link>
          </div>
          <div
            className="item trash"
            onClick={() => handleDeleteConfirm(row.id)}
          >
            <i className="icon-trash-2"></i>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="main-content-inner">
        {/* <!-- main-content-wrap --> */}
        <div className="main-content-wrap">
          <div className="flex items-center flex-wrap justify-between gap20 mb-27">
            <h3>All Staff</h3>
            <ul className="breadcrumbs flex items-center flex-wrap justify-start gap10">
              <li>
                <Link to="/">
                  <div className="text-tiny">Dashboard</div>
                </Link>
              </li>
              <li>
                <i className="icon-chevron-right"></i>
              </li>
              <li>
                <Link to="#">
                  <div className="text-tiny">Staff</div>
                </Link>
              </li>
              <li>
                <i className="icon-chevron-right"></i>
              </li>
              <li>
                <div className="text-tiny">All Staff</div>
              </li>
            </ul>
          </div>
          {/* <!-- all-user --> */}
          <div className="wg-box wg-content">
            <div className="flex items-center justify-between gap10 flex-wrap mb-3">
              <div className="wg-filter flex-grow">
                <form
                  className="form-search"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <fieldset className="name">
                    <input
                      type="text"
                      placeholder="Search staff..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-required="true"
                    />
                  </fieldset>
                  <div className="button-submit">
                    <button type="submit">
                      <i className="icon-search"></i>
                    </button>
                  </div>
                </form>
              </div>

              <Link
                className="tf-button style-1 w208"
                to="/create-staff"
                onClick={handleCreateStaff}
              >
                <i className="icon-plus"></i>Add new
              </Link>
            </div>

            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              highlightOnHover
              pointerOnHover
              responsive
              customStyles={{
                headCells: {
                  style: {
                    fontWeight: "bold",
                    fontSize: "14px",
                  },
                },
              }}
            />
            <div className="divider"></div>
          </div>
          {/* <!-- /all-user --> */}
        </div>
        {/* <!-- /main-content-wrap --> */}
      </div>
    </Layout>
  );
};
export default Staff;
